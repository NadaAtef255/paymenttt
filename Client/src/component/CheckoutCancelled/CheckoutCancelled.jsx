import React from "react";
import { Link } from "react-router-dom";
import "./../CheckoutSuccess/CheckoutStyle.css";

function CheckoutCancelled() {
  return (
    <div className="checkout">
      <h1>Payment failed</h1>
      <p>Payment was not successful</p>
      <div>
        <Link className="button is-black nomad-btn submit" to={"/allbooks"}>
          Return to Books
        </Link>
      </div>
    </div>
  );
}

export default CheckoutCancelled;
