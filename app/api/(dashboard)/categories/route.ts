import connect from "@/lib/db";
import User from "@/lib/models/users";
import Category from "@/lib/models/category";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if(!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({message: "Invalid or missing user id"}), {status: 400});
        }

        await connect();

        const user = await User.findById(userId);
        if(!user) {
            return new NextResponse(JSON.stringify({message: "User does not exist"}), {status: 400});
        }

        const categories = await Category.find({user: new Types.ObjectId(userId)});
        return new NextResponse(JSON.stringify(categories), {status: 200});

    } catch (error: any) {
        return new NextResponse("Error: "+error.message, {status: 500});
    }
};

export const POST = async (request: Request) => {
    try {

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if(!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({message: "Invalid or missing user id"}), {status: 400});
        }

        const {title} = await request.json();

        await connect();
        const user = await User.findById(userId);
        if(!user) {
            return new NextResponse(JSON.stringify({message: "User does not exist"}), {status: 400});
        }

        const newCategory = new Category({
            title,
            user: new Types.ObjectId(userId)
        });

        await newCategory.save();

        return new NextResponse(JSON.stringify({message: "category created"}), {status: 200});

    }  catch (error: any) {
        return new NextResponse("Error: "+error.message, {status: 500});
    }
};





