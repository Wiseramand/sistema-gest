import NextAuth from "next-auth"
import { getAuthOptions } from "@/lib/auth"

const handler = NextAuth(getAuthOptions('student'))

export { handler as GET, handler as POST }
