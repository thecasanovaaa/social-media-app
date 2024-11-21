import * as z from "zod";

export const SignupValidation = z.object({
    name: z.string().min(2,{message:"Too Short just like your dick"}),
    username: z.string().min(2,{message:"Zyada Naam mat soch Lodu rakh de"}),
    email: z.string().email(),
    password: z.string().min(8,{message:"Kya be jhatu 8 character dalna"}),
  })

export const SigninValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8,{message:"Kya be jhatu 8 character dalna"}),
  })
export const PostValidation = z.object({
    caption: z.string().min(5,{message:"Add minimum 5 character"}).max(2200),
    file:z.custom<File[]>(),
    location: z.string().min(2,{message:"Add minimum 2 character"}).max(100),
    tags: z.string(),
  })

  export const ProfileValidation = z.object({
    file: z.custom<File[]>(),
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    username: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email(),
    bio: z.string(),
  });