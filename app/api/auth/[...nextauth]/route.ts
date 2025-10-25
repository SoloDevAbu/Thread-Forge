import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/lib/prisma'

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Create or update profile when user signs in
          await prisma.profile.upsert({
            where: { userId: user.id },
            update: {
              email: user.email!,
              fullName: user.name || null,
              avatarUrl: user.image || null,
              updatedAt: new Date(),
            },
            create: {
              userId: user.id,
              email: user.email!,
              fullName: user.name || null,
              avatarUrl: user.image || null,
            },
          })
        } catch (error) {
          console.error('Error creating/updating profile:', error)
        }
      }
      return true
    },
    async session({ session, user }) {
      if (session.user && user) {
        (session.user as any).id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
})

export { handler as GET, handler as POST }
