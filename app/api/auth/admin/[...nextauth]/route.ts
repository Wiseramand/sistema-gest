import NextAuth from "next-auth"
import { getAuthOptions } from "@/lib/auth"

const handler = NextAuth(getAuthOptions('admin'))

export { handler as GET, handler as POST }
