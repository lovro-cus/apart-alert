// Prikaz podrobnosti enega apartmaja (predstavitvena komponenta).
export default function ApartmentDetails({ apartment, onClose }) {
  if (!apartment) return null;

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: 16,
    padding: "30px 35px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: 15 }}>{apartment.name}</h2>
        <p><b>Lokacija:</b> {apartment.location}</p>
        <p><b>Cena:</b> {apartment.price} € / noč</p>
        <p><b>Ocena:</b> {apartment.rating} ★</p>
        <p><b>Razdalja od centra:</b> {apartment.distance} m</p>

        <button
          onClick={onClose}
          style={{
            marginTop: 20,
            width: "100%",
            padding: 12,
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          Zapri
        </button>
      </div>
    </div>
  );
}
