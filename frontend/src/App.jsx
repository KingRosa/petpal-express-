import {
  useEffect,
  useState,
} from "react";

import PetCard from "./PetCard";

import "./App.css";


/* ==================================================
   API URL
================================================== */

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";


export default function App() {
  const [pets, setPets] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [message, setMessage] =
    useState("");


  /* ==================================================
     LOAD PETS
  ================================================== */

  async function loadPets() {
    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `${API}/pets`
        );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data =
        await response.json();

      setPets(data);

    } catch (error) {
      console.error(
        "Failed to fetch pets:",
        error
      );

      setError(
        "Failed to load pets from the server. Make sure the backend is running."
      );

    } finally {
      setLoading(false);
    }
  }


  /* ==================================================
     INITIAL LOAD
  ================================================== */

  useEffect(() => {
    loadPets();
  }, []);


  /* ==================================================
     ADOPT PET
  ================================================== */

  async function adopt(id) {
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          `${API}/adopt/${id}`,
          {
            method: "POST",
          }
        );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data =
        await response.json();

      setPets(
        (currentPets) =>
          currentPets.map(
            (pet) =>
              pet.id === id
                ? data.pet
                : pet
          )
      );

      setMessage(
        `♥ ${data.pet.name} has found a home!`
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error(
        "Failed to adopt pet:",
        error
      );

      setError(
        "We couldn't complete the adoption. Please try again."
      );
    }
  }


  /* ==================================================
     RETURN PET
  ================================================== */

  async function returnPet(id) {
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          `${API}/return/${id}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data =
        await response.json();

      setPets(
        (currentPets) =>
          currentPets.map(
            (pet) =>
              pet.id === id
                ? data.pet
                : pet
          )
      );

      setMessage(
        `${data.pet.name} is available for adoption again.`
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error(
        "Failed to return pet:",
        error
      );

      setError(
        "We couldn't return this pet. Please try again."
      );
    }
  }


  /* ==================================================
     DISCOVER NEW PETS
  ================================================== */

  async function refreshPets() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          `${API}/pets/refresh`,
          {
            method: "POST",
          }
        );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data =
        await response.json();

      setPets(data);

      setFilter("All");

      setMessage(
        "🐾 New pets are ready to meet!"
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error(
        "Failed to refresh pets:",
        error
      );

      setError(
        "We couldn't generate new pets. Make sure the backend is running."
      );

    } finally {
      setLoading(false);
    }
  }


  /* ==================================================
     FILTER PETS
  ================================================== */

  const filteredPets =
    filter === "All"
      ? pets
      : pets.filter(
          (pet) =>
            pet.type === filter
        );


  /* ==================================================
     PET COUNTS
  ================================================== */

  const adoptedCount =
    pets.filter(
      (pet) => pet.adopted
    ).length;

  const availableCount =
    pets.length -
    adoptedCount;


  /* ==================================================
     UI
  ================================================== */

  return (
    <main className="petpal-app">

      <header className="petpal-header">
        <p className="petpal-eyebrow">
          ADOPT • LOVE • REPEAT
        </p>

        <h1 className="petpal-title">
          🐾 PetPal Express
        </h1>

        <p className="petpal-subtitle">
          Find your new companion
          for life. Meet lovable pets
          searching for their forever
          homes.
        </p>
      </header>


      <section className="pet-controls-section">

        <div className="pet-stats">

          <div className="stat-card">
            <span className="stat-icon">
              🐾
            </span>

            <div className="stat-info">
              <strong>
                {availableCount}
              </strong>

              <span>
                Available
              </span>
            </div>
          </div>


          <div className="stat-card">
            <span className="stat-icon">
              ♥
            </span>

            <div className="stat-info">
              <strong>
                {adoptedCount}
              </strong>

              <span>
                Adopted
              </span>
            </div>
          </div>

        </div>


        <div className="filter-buttons">

          <button
            className={
              filter === "All"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setFilter("All")
            }
          >
            All Pets
          </button>


          <button
            className={
              filter === "Dog"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setFilter("Dog")
            }
          >
            🐶 Dogs
          </button>


          <button
            className={
              filter === "Cat"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setFilter("Cat")
            }
          >
            🐱 Cats
          </button>


          <button
            className={
              filter === "Rabbit"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setFilter("Rabbit")
            }
          >
            🐰 Rabbits
          </button>

        </div>


        <div className="petpal-controls">

          <button
            className="refresh-button"
            onClick={refreshPets}
            disabled={loading}
          >
            {loading
              ? "Finding Pets..."
              : "↻ Discover New Pets"}
          </button>

        </div>

      </section>


      {message && (
        <div className="success-message">
          {message}
        </div>
      )}


      {loading && (
        <div className="loading-container">

          <div className="loading-paw">
            🐾
          </div>

          <p>
            Finding new friends...
          </p>

        </div>
      )}


      {error && (
        <div className="error-message">

          <strong>
            Something went wrong.
          </strong>

          <span>
            {error}
          </span>

          <button
            className="refresh-button"
            onClick={loadPets}
          >
            Try Again
          </button>

        </div>
      )}


      {!loading &&
        !error &&
        filteredPets.length === 0 && (

          <div className="empty-state">

            <span className="empty-icon">
              🐾
            </span>

            <h2>
              No pets found
            </h2>

            <p>
              Try another category or
              discover some new pets.
            </p>

          </div>
        )}


      {!loading &&
        !error && (

          <section className="pet-grid">

            {filteredPets.map(
              (pet) => (

                <PetCard
                  key={pet.id}
                  pet={pet}
                  adopt={adopt}
                  returnPet={returnPet}
                />

              )
            )}

          </section>
        )}


      <footer className="petpal-footer">

        <span className="footer-paw">
          🐾
        </span>

        <p>
          PetPal Express
        </p>

 
        <p>By KingRosa Inc ©</p>
        
        <br /> 
        <small>
          Helping pets find their
          forever homes.
        </small>
       

      </footer>

    </main>
  );
}