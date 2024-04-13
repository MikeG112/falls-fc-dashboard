import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
// import { compare } from "bcrypt";

export const {
  handlers: { GET, POST },
  auth
} = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.OAUTH_CLIENT_KEY as string,
      clientSecret: process.env.OAUTH_CLIENT_SECRET as string
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'user' },
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const user = {
          id: '2',
          name: 'Community User',
        };

        const admin_user = {
          id: '1',
          name: 'Admin User',
        };

        // For now, just require a particular sign in val in this case
        if (
          (process.env.DEFAULT_USERNAME === credentials.username) &&
          (process.env.DEFAULT_PW === credentials.password)
        ) {
          return user;
        } else if (
          (process.env.ADMIN_USERNAME === credentials.username) &&
          (process.env.ADMIN_PW === credentials.password)
        ) {
          return admin_user;
        }
        else {
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
});
