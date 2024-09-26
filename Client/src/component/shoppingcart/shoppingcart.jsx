import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSadTear } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import PayButton from "./../PayButton/PayButton";
import "./shoppingcart.css";

const ShoppingCart = () => {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [open, setOpen] = useState(false); // State variable for Snackbar
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const calcTotal = (arr) => {
    const value = arr.reduce((accumulator, current) => {
      return accumulator + Number(current.bookPrice);
    }, 0);
    return value;
  };

  const handleDelete = (book) => {
    setSelectedBook(book);
    setDeleteModalShow(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post(
        "http://localhost:4000/cartcpy/delete",
        { bookTitle: selectedBook.bookTitle },
        config
      );
      setCart(cart.filter((item) => item.bookTitle !== selectedBook.bookTitle));
      setTotalPrice(
        calcTotal(
          cart.filter((item) => item.bookTitle !== selectedBook.bookTitle)
        )
      );
      setOpen(true); // Open Snackbar when item is successfully removed
    } catch (error) {
      console.error("Error deleting book:", error);
    }
    setDeleteModalShow(false);
  };

  useEffect(() => {
    const getCartData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const res = await axios.get(`http://localhost:4000/cartcpy`, config);
        const data = res.data.userCart.items;
        setTotalPrice(calcTotal(data));
        setCart(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching book details:", error);
        setLoading(false);
      }
    };
    getCartData();
  }, []);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false); // Close Snackbar
  };

  return (
    <>
      {cart.length > 0 ? (
        <div className="container mt-5 p-3  cart">
          <div className="row no-gutters">
            <div className="col-md-8">
              <div className="product-details mb-3">
                <h2>
                  Shopping<b> Cart {`(${cart.length})`}</b>
                </h2>

                <div className="container">
                  <div className="row">
                    <div className="col-md-12 col-sm-4">
                      <motion.table
                        className="table text-center tablecart"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <thead className="text-dark">
                          <tr>
                            <th>Products</th>
                            <th>Price</th>
                            <th>Remove</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((book, index) => (
                            <motion.tr
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                              className="table-row"
                            >
                              <td className="d-flex">
                                <div className="bookImage">
                                  <img
                                    className="rounded "
                                    src={book.bookImage}
                                    width={50}
                                    alt=""
                                  />
                                </div>
                                <div className="p-3">
                                  <span className="d-block ">
                                    {book.bookTitle}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">{book.bookPrice}$</td>
                              <td className="p-4">
                                <i
                                  className="fas fa-trash mx-4 delete"
                                  onClick={() => handleDelete(book)}
                                />
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </motion.table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card col-md-4 mx-auto">
              <div className="card-header">
                <h6 className="card-text">Cart Summary</h6>
              </div>
              <div className="card-footer border-secondary bg-transparent">
                <div className="d-flex justify-content-between">
                  <h6>Total</h6>
                  <h6>{totalPrice}$</h6>
                </div>
                {cart.length > 0 && (
                  <PayButton cartItems={cart}>Checkout</PayButton>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-5">
          <FontAwesomeIcon
            icon={faSadTear}
            size="4x"
            className="text-muted mb-3"
          />
          <p className="mb-3">You haven't added any books yet!</p>
          <p className="mb-3">
            Add some books to your Cart by browsing our collection.
          </p>
          <Link to="/allbooks">
            <button className="btn btn-outline-secondary mb-5">
              Go To Shopping
            </button>
          </Link>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        show={deleteModalShow}
        onHide={() => setDeleteModalShow(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this book from your cart?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModalShow(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Snackbar to show item removed message */}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} // Change anchorOrigin to top-right corner
      >
        <MuiAlert
          onClose={handleClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Book removed successfully!
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default ShoppingCart;
