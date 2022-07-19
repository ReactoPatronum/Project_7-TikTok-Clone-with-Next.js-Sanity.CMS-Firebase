import { client } from "../../utils/client";

export default function handler(req, res) {
  if (req.method === "POST") {
    const { _id } = req.body;
    client
      .delete(`${_id}`)
      .then(() => res.status(200).json("Post Deleted..."));
  }
}
