import connect from "@/lib/db";
import Blog from "@/lib/models/blog";
import User from "@/lib/models/users";
import Category from "@/lib/models/category";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
    try {
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        const searchKeywords = searchParams.get("keywords") as string;
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        if(!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({message: "Invalid or missing user id"}), {status: 400});
        }

        if(!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(JSON.stringify({message: "Invalid or missing category id"}), {status: 400});
        }

        await connect();

        const user = await User.findById(userId);
        if(!user) {
            return new NextResponse(JSON.stringify({message: "User does not exist"}), {status: 400});
        }

        const category = await Category.findById(categoryId);
        if(!category) {
            return new NextResponse(JSON.stringify({message: "Category does not exist"}), {status: 400});
        }

        const filter: any = {
            user: new Types.ObjectId(userId),
            category: new Types.ObjectId(categoryId)
        };

        if(searchKeywords) {
            const regex = new RegExp(searchKeywords, 'i');
            filter.$or = [
                {
                    title: { $regex: regex }
                },
                {
                    description: { $regex: regex }
                }
            ];
        }

        if(startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if(startDate) {
            filter.createdAt = {
                $gte: new Date(startDate)
            };
        } else if(endDate) {
            filter.createdAt = {
                $lte: new Date(endDate)
            };
        } 
        
        const skip = (page-1) * limit;

        const blogs = await Blog.find(filter)
            .sort({createdAt: "asc"})
            .skip(skip)
            .limit(limit);

        return new NextResponse(JSON.stringify(blogs), {status: 200});

    } catch(error: any) {
        return new NextResponse("Error: "+error.message, {status: 500});
    }
};


export const POST = async (request: Request) => {
    try {
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
    
        if(!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({message: "Invalid or missing user id"}), {status: 400});
        }
    
        if(!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(JSON.stringify({message: "Invalid or missing category id"}), {status: 400});
        }

        const body = await request.json();
        const {title, description} = body;
    
        await connect();

        const user = await User.findById(userId);
        if(!user) {
            return new NextResponse(JSON.stringify({message: "User does not exist"}), {status: 404});
        }

        const category = await Category.findById(categoryId);
        if(!category) {
            return new NextResponse(JSON.stringify({message: "Category does not exist"}), {status: 404});
        }

        const newBlog = new Blog({
            title,
            description,
            user: new Types.ObjectId(userId),
            category: new Types.ObjectId(categoryId)
        });

        await newBlog.save();
        return new NextResponse(JSON.stringify({message: "Blog is created", blog: newBlog}), {status: 200});

    } catch(error: any) {
        return new NextResponse("Error: "+error.message, {status: 500});
    }


};

