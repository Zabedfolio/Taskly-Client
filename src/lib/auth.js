import { betterAuth } from "better-auth";
import { MongoClient} from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI);

const db = client.db("taskly-db");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        returned: true,
        input: true,
        defaultValue: "client",
      },
      onboardingComplete: {
        type: "boolean",
        required: false,
        returned: true,
        input: true,
        defaultValue: false,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        returned: true,
        input: false,
        defaultValue: false,
      },
      skills: {
        type: "string",
        required: false,
        returned: true,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        returned: true,
        input: true,
      },
      hourlyRate: {
        type: "number",
        required: false,
        returned: true,
        input: true,
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          let userId = session.userId;
          if (userId) {
            const user = await db.collection("user").findOne({
              $or: [
                { _id: userId },
                { _id: new ObjectId(userId) }
              ]
            });
            if (user && user.isBlocked) {
              throw new Error("Your account has been blocked.")
            }
          }
          return { data: session };
        }
      }
    }
  }
});