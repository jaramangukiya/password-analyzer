import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const password: string = body.password;

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);

  return NextResponse.json({
    hashed: hash,
    algorithm: "bcrypt",
    cost: saltRounds,
  });
}