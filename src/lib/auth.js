
import { betterAuth } from "better-auth";
import { MongoClient, ObjectId } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("taskly-db");

export const auth = betterAuth({
  database: mongodbAdapter(db),

  advanced: {
    useSecureCookies: true,
  },

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
    user: {
      create: {
        before: async (user) => {
          if (!user.role) {
            user.role = "client";
            }

          if (user.onboardingComplete === undefined || user.onboardingComplete === null || user.onboardingComplete === false) {
            user.onboardingComplete = true;
          }
          return { data: user };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const userId = session.userId;
          if (userId) {
            let user = null;

            try {
              user = await db.collection("user").findOne({
                _id: new ObjectId(userId),
              });
            } catch {
              user = await db.collection("user").findOne({ _id: userId });

            }
            if (user?.isBlocked) {
              throw new Error("Your account has been blocked.");
            }

            
            let googleAccount = null;
            try {
              googleAccount = await db.collection("account").findOne({
                $or: [
                  { userId: userId, providerId: "google" },
                  { userId: new ObjectId(userId), providerId: "google" }
                  ]
              });
            } catch {
              try {
                googleAccount = await db.collection("account").findOne({
                    userId: userId,
                  providerId: "google"
                });
              } catch (e) {
                
              }
               }

            if (googleAccount && user) {
              const updateDoc = {};
              if (!user.role) {
                updateDoc.role = "client";
              }
              if (!user.onboardingComplete) {
                updateDoc.onboardingComplete = true;
              }

              if (Object.keys(updateDoc).length > 0) {
                try {
                  await db.collection("user").updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: updateDoc }
                  );
                } catch {
                  await db.collection("user").updateOne(
                    { _id: userId },
                    { $set: updateDoc }
                  );
                   }
              }

            }
          }
          return   { data: session };
        },
      },
    },
  },
});