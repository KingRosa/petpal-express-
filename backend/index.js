import express from "express";
import cors from "cors";
import { db } from "./firebaseAdmin.js";

const app = express();

const PORT = process.env.PORT || 3000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";


/* ==================================================
   MIDDLEWARE
================================================== */

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


/* ==================================================
   PET DATA
================================================== */

const names = [
  "Luna",
  "Max",
  "Bella",
  "Coco",
  "Milo",
  "Charlie",
  "Daisy",
  "Rocky",
];

const types = [
  "Cat",
  "Dog",
  "Rabbit",
];

const traits = [
  "Playful",
  "Friendly",
  "Bubbly",
  "Lazy",
  "Curious",
  "Sweet",
  "Energetic",
];


/* ==================================================
   FALLBACK IMAGES
================================================== */

const fallbackImages = {
  Dog:
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",

  Cat:
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80",

  Rabbit:
    "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80",
};


/* ==================================================
   DOG IMAGE
================================================== */

async function dogPic() {
  try {
    const response = await fetch(
      "https://dog.ceo/api/breeds/image/random"
    );

    if (!response.ok) {
      throw new Error(
        `Dog API returned ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.message) {
      throw new Error(
        "Dog API did not return an image."
      );
    }

    return data.message;
  } catch (error) {
    console.error(
      "Failed to get dog image:",
      error.message
    );

    return fallbackImages.Dog;
  }
}


/* ==================================================
   CAT IMAGE
================================================== */

async function catPic() {
  try {
    const response = await fetch(
      "https://api.thecatapi.com/v1/images/search"
    );

    if (!response.ok) {
      throw new Error(
        `Cat API returned ${response.status}`
      );
    }

    const data = await response.json();

    const image = data[0]?.url;

    if (!image) {
      throw new Error(
        "Cat API did not return an image."
      );
    }

    return image;
  } catch (error) {
    console.error(
      "Failed to get cat image:",
      error.message
    );

    return fallbackImages.Cat;
  }
}


/* ==================================================
   RABBIT IMAGE
================================================== */

function rabbitPic() {
  const rabbitImages = [
    "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80",

    "https://images.unsplash.com/photo-1609151354448-c4a53450c6e9?auto=format&fit=crop&w=800&q=80",

    "https://images.unsplash.com/photo-1559214369-a6b1d7919865?auto=format&fit=crop&w=800&q=80",
  ];

  const randomIndex = Math.floor(
    Math.random() * rabbitImages.length
  );

  return (
    rabbitImages[randomIndex] ||
    fallbackImages.Rabbit
  );
}


/* ==================================================
   CREATE RANDOM PET
================================================== */

async function makePet(id) {
  const name =
    names[
      Math.floor(
        Math.random() * names.length
      )
    ];

  const type =
    types[
      Math.floor(
        Math.random() * types.length
      )
    ];

  const trait =
    traits[
      Math.floor(
        Math.random() * traits.length
      )
    ];

  let image;

  if (type === "Dog") {
    image = await dogPic();
  } else if (type === "Cat") {
    image = await catPic();
  } else {
    image = rabbitPic();
  }

  return {
    id,
    name,
    type,
    trait,
    image,
    adopted: false,
  };
}


/* ==================================================
   SEED FIRESTORE
================================================== */

async function seedPets() {
  try {
    const snapshot = await db
      .collection("pets")
      .get();

    if (!snapshot.empty) {
      console.log(
        "🐾 Pets already exist in Firestore."
      );

      return;
    }

    console.log(
      "Creating initial PetPal pets..."
    );

    const batch = db.batch();

    for (let i = 1; i <= 5; i++) {
      const pet = await makePet(i);

      const petRef = db
        .collection("pets")
        .doc(String(i));

      batch.set(
        petRef,
        pet
      );
    }

    await batch.commit();

    console.log(
      "✅ Initial pets added to Firestore."
    );
  } catch (error) {
    console.error(
      "SEED FIRESTORE ERROR:"
    );

    console.error(error);
  }
}


/* ==================================================
   HEALTH CHECK
================================================== */

app.get("/", (req, res) => {
  return res
    .status(200)
    .send(
      "🐾 PetPal Express API is running!"
    );
});


/* ==================================================
   GET ALL PETS
================================================== */

app.get(
  "/api/pets",
  async (req, res) => {
    try {
      const snapshot = await db
        .collection("pets")
        .get();

      const pets =
        snapshot.docs.map(
          (doc) => ({
            ...doc.data(),
            id: Number(doc.id),
          })
        );

      pets.sort(
        (a, b) =>
          a.id - b.id
      );

      return res
        .status(200)
        .json(pets);
    } catch (error) {
      console.error(
        "GET PETS FIRESTORE ERROR:"
      );

      console.error(error);

      return res
        .status(500)
        .json({
          error:
            "Failed to load pets from Firestore.",

          details:
            error.message,
        });
    }
  }
);


/* ==================================================
   GET ONE PET
================================================== */

app.get(
  "/api/pets/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const petDoc =
        await db
          .collection("pets")
          .doc(String(id))
          .get();

      if (!petDoc.exists) {
        return res
          .status(404)
          .json({
            error:
              "Pet not found.",
          });
      }

      return res
        .status(200)
        .json({
          ...petDoc.data(),

          id: Number(
            petDoc.id
          ),
        });
    } catch (error) {
      console.error(
        "GET PET ERROR:"
      );

      console.error(error);

      return res
        .status(500)
        .json({
          error:
            "Failed to load pet.",

          details:
            error.message,
        });
    }
  }
);


/* ==================================================
   ADOPT PET
================================================== */

app.post(
  "/api/adopt/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const petRef = db
        .collection("pets")
        .doc(String(id));

      const petDoc =
        await petRef.get();

      if (!petDoc.exists) {
        return res
          .status(404)
          .json({
            error:
              "Pet not found.",

            id: Number(id),
          });
      }

      await petRef.update({
        adopted: true,
      });

      const updatedPet =
        await petRef.get();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Pet adopted successfully.",

          pet: {
            ...updatedPet.data(),

            id: Number(
              updatedPet.id
            ),
          },
        });
    } catch (error) {
      console.error(
        "ADOPT PET ERROR:"
      );

      console.error(error);

      return res
        .status(500)
        .json({
          error:
            "Failed to adopt pet.",

          details:
            error.message,
        });
    }
  }
);


/* ==================================================
   RETURN PET
================================================== */

app.delete(
  "/api/return/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const petRef = db
        .collection("pets")
        .doc(String(id));

      const petDoc =
        await petRef.get();

      if (!petDoc.exists) {
        return res
          .status(404)
          .json({
            error:
              "Pet not found.",

            id: Number(id),
          });
      }

      await petRef.update({
        adopted: false,
      });

      const updatedPet =
        await petRef.get();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Pet returned successfully.",

          pet: {
            ...updatedPet.data(),

            id: Number(
              updatedPet.id
            ),
          },
        });
    } catch (error) {
      console.error(
        "RETURN PET ERROR:"
      );

      console.error(error);

      return res
        .status(500)
        .json({
          error:
            "Failed to return pet.",

          details:
            error.message,
        });
    }
  }
);


/* ==================================================
   DISCOVER NEW PETS
================================================== */

app.post(
  "/api/pets/refresh",
  async (req, res) => {
    try {
      console.log(
        "🐾 Generating new pets..."
      );

      const newPets = [];
      const batch = db.batch();

      for (
        let i = 1;
        i <= 5;
        i++
      ) {
        const pet =
          await makePet(i);

        const petRef = db
          .collection("pets")
          .doc(String(i));

        batch.set(
          petRef,
          pet
        );

        newPets.push(
          pet
        );
      }

      await batch.commit();

      console.log(
        "✅ New pets generated and saved to Firestore."
      );

      return res
        .status(200)
        .json(newPets);
    } catch (error) {
      console.error(
        "REFRESH PETS ERROR:"
      );

      console.error(error);

      return res
        .status(500)
        .json({
          error:
            "Failed to generate new pets.",

          details:
            error.message,
        });
    }
  }
);


/* ==================================================
   404 HANDLER
================================================== */

app.use((req, res) => {
  return res
    .status(404)
    .json({
      error:
        "Route not found.",

      method:
        req.method,

      path:
        req.url,

      message:
        "Check the HTTP method and URL.",
    });
});


/* ==================================================
   START SERVER
================================================== */

app.listen(
  PORT,
  async () => {
    console.log(
      `🐾 PetPal Express API running at http://localhost:${PORT}`
    );

    await seedPets();
  }
);