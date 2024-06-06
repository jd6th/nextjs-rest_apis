import connect from "@/lib/db";
import User from "@/lib/models/users";
import Category from "@/lib/models/category";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const PATCH = async (request: Request, context: {params: any}) => {
    const categoryId = context.params.category;
    try {
        const body = await request.json();
        const {title} = body;

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

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

        const category = await Category.findOne({_id: categoryId, user: userId});
        if(!category) {
            return new NextResponse(JSON.stringify({message: "Category does not exist"}), {status: 400});
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            {title},
            {new: true}
        );

        return new NextResponse(JSON.stringify({message: "Category is updated"}), {status: 200});


    } catch (error: any) {
        return new NextResponse("Error:"+error.message, {status: 500});
    }
};

export const DELETE = async (request: Request, context: {params: any}) => {
    const categoryId = context.params.category;
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

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

        const category = await Category.findOne({_id: categoryId, user: userId});
        if(!category) {
            return new NextResponse(JSON.stringify({message: "Category does not exist"}), {status: 400});
        }

        await Category.findByIdAndDelete(categoryId);

        return new NextResponse(JSON.stringify({message: "Category is deleted"}), {status: 200});

    } catch (error: any) {
        return new NextResponse("Error:"+error.message, {status: 500});
    }
};






