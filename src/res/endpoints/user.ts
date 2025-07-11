import { HTTPException } from "hono/http-exception";
import app from "../app";
import { z } from "@hono/zod-openapi";
import sharp from "sharp";
import { file } from "bun";
import { getUserWithID } from "../../utils/user";

const sample_icon = await file("./src/utils/sample.png").bytes();

app.openapi({
  path: "/user/:id/:width/", method: "get",
  description: "ユーザーアイコンを返します",
  request: {
    params: z.object({
      id: z.string().regex(/^\d+$/).describe("ユーザーID"),
      width: z.string().regex(/^\d+$/).describe("画像サイズ")
    })
  },
  responses: {
    200: {
      description: "おｋ",
      content: {
        "image/png": {
          schema: z.string().describe("画像")
        }
      }
    }
  }
}, async c => {
  const { id, width } = c.req.valid("param");

  const user = getUserWithID(parseInt(id));
  if(!user) throw new HTTPException(404);

  return c.body(await sharp(user.icon ?? sample_icon)
    .resize(parseInt(width))
    .toFormat("png")
    .toBuffer(), 200, {
      "Content-Type": "image/png"
    });
})
