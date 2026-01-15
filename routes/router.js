import express from "express";
import Note from "../models/notesSchema.js";
import { faker } from '@faker-js/faker';
import e from "express";

const router = express.Router();

router.use((req, res, next) => {
    console.log("check accept header");
    if (req.headers.accept && req.headers.accept === "application/json") {
        next();
    } else {
        if (req.method === "OPTIONS") {
            next();
        } else {
            res.status(406).json({error: "Webservice only supports json."});
        }
    }
});

router.get("/", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    const notes = await Note.find({}, '-body');
    res.json({
        items: notes,
        _links: {
            self: {
                href: `${process.env.BASE_URI}`,
            },
            collection: {
                href: `${process.env.BASE_URI}`,
            }
        },
    });
})

router.post("/seed",  async (req, res) => {
    const notes = [];
    await Note.deleteMany({});
    const amount = req.body?.amount ?? 10;
    for (let i = 0; i < amount; i++) {
        const note = new Note({
            title: faker.lorem.slug(),
            body: faker.lorem.text(),
            author: faker.person.fullName()
        });
        note.save();
        notes.push(note);
    }
    res.json(notes);
});

router.options("/", (req, res) => {
    res.header("Allow", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.status(204).send();
})

router.post("/", async (req, res) => {
    const { title, body, author } = req.body;
    if (!title || !body || !author) {
        return res.status(400).json({ error: "Title, body and author are required" });
    }
    const note = new Note({ title, body, author });
    try {
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
})

router.put("/:id", async (req, res) => {
    const noteId = req.params.id;
    const { title, body, author } = req.body;
    if (!title || !body || !author) {
        return res.status(400).json({ error: "Title, body and author are required" });
    }
    try {
        const note = await Note.findByIdAndUpdate(
            noteId,
            { title, body, author, updatedAt: Date.now() },
            { new: true }
        );
        if (!note) {
            return res.status(404).json({ error: "Note not found" });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
})

router.delete("/:id", async (req, res) => {
    const noteId = req.params.id;
    try {
        const result = await Note.findByIdAndDelete(noteId);
        if (!result) {
            return res.status(404).json({ error: "Note not found" });
        }
        res.status(204).json({ message: "Note deleted" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
})

router.get("/:id", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    const noteId = req.params.id;
    try {
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ error: "Note not found" });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
})

router.options("/:id", (req, res) => {
    res.header("Allow", "GET, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.status(204).send();
})

export default router;