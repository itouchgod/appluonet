import { auth } from "@/auth"
import { NextRequest } from "next/server"

export const GET = auth as (request: NextRequest) => Promise<Response>
export const POST = auth as (request: NextRequest) => Promise<Response>