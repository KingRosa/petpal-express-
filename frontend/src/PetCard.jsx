import "./PetCard.css";

export default function PetCard({
  pet,
  adopt,
  returnPet,
}) {
  return (
    <article
      className={`pet-card ${
        pet.adopted
          ? "pet-card-adopted"
          : ""
      }`}
    >

      <div className="pet-image-container">

        <img
          className="pet-image"
          src={pet.image}
          alt={`${pet.name} the ${pet.type}`}
        />

        <span
          className={`pet-status ${
            pet.adopted
              ? "pet-status-adopted"
              : "pet-status-available"
          }`}
        >
          {pet.adopted
            ? "♥ Adopted"
            : "● Available"}
        </span>

      </div>

      <div className="pet-card-content">

        <p className="pet-type">
          {pet.type}
        </p>

        <h3 className="pet-name">
          {pet.name}
        </h3>

        <span className="pet-trait">
          ✨ {pet.trait}
        </span>

        <p className="pet-description">
          {pet.adopted
            ? `${pet.name} has found a loving home!`
            : `${pet.name} is looking for someone special to call family.`}
        </p>

        <div className="pet-actions">

          {!pet.adopted ? (
            <button
              className="adopt-button"
              onClick={() =>
                adopt(pet.id)
              }
            >
              Adopt {pet.name} ♥
            </button>
          ) : (
            <button
              className="return-button"
              onClick={() =>
                returnPet(pet.id)
              }
            >
              Return {pet.name}
            </button>
          )}

        </div>

      </div>

    </article>
  );
}