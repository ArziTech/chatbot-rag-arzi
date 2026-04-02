import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedFields = signupSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: "Invalid fields",
          details: validatedFields.error.issues,
        },
        { status: 400 },
      );
    }

    const { username, name, email, password } = validatedFields.data;

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 },
      );
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 },
        );
      }
    }

    // Get default USER role (roleId = 2)
    const userRole = await prisma.role.findUnique({
      where: { id: 2 },
    });

    if (!userRole) {
      return NextResponse.json(
        { error: "Default user role not found" },
        { status: 500 },
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        name,
        email: email || null,
        password: hashedPassword,
        roleId: 2, // Default USER role
        status: true,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        roleId: true,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
