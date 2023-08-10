import { Request, Response } from "express";

const getRoot = async (req: Request, res: Response) => {
    return res.status(200).json({ msg: "Getting the api root" });
};

export default getRoot;
