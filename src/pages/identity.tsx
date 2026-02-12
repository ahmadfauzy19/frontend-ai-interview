import AppLayout from "./appLayout";
import CardLogin from "../components/cardLogin";
import manImage from "../assets/img/image_man.png";
import "../assets/style/identityStyle.css";

const Identity = () => {
  return (
    <AppLayout title="Formulir">
      <div className="identity-container">
        
        {/* LEFT IMAGE */}
        <div className="identity-left">
          <img src={manImage} alt="Interview Illustration" />
        </div>

        {/* RIGHT CARD */}
        <div className="identity-right">
          <CardLogin />
        </div>

      </div>
    </AppLayout>
  );
};

export default Identity;
