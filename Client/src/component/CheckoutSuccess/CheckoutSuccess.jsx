import { Link } from "react-router-dom";

const CheckoutSuccess = () => {
  return (
    <div className="checkout">
      <h1>Thank you for your order</h1>
      <p>
        We are currently processing your order and will send you a confirmation
        email shortly
      </p>
      <div>
        <Link className="button is-black nomad-btn submit" to={"/allbooks"}>
          Return to Books
        </Link>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
