import NextAuth from "next-auth"
import { getAuthOptions } from "@/lib/auth"

const handler = NextAuth(getAuthOptions('professor'))

export { handler as GET, handler as POST }
