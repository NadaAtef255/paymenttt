import React, { useState } from "react";
import { motion } from "framer-motion";
import "./aboutus.css";

import img1 from "../../assets/images/img1.png";
import img2 from "../../assets/images/img2.jpg";
import img3 from "../../assets/images/img3.jpg";
import img4 from "../../assets/images/img4.jpg";
import img5 from "../../assets/images/img5.jpg";
import img7 from "../../assets/images/img7.jpg";
import axios from "axios";
import { Alert, Snackbar } from "@mui/material";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Mahmoud Samir",
      position: "Backend Developer",
      description: "Description for member 1",
      imageUrl: img1,
    },
    {
      name: "Shams AbdelTwab",
      position: "Backend",
      description: "Description for member 2",
      imageUrl: img2,
    },
    {
      name: "Mohammed Tarek",
      position: "Frontend",
      description: "Description for member 3",
      imageUrl: img3,
    },
    {
      name: "Menna Mohammed",
      position: "Backend developer",
      description: "Description for member 4",
      imageUrl: img4,
    },
    {
      name: "Fatma Soliman ",
      position: "Frontend",
      description: "Description for member 5",
      imageUrl: img5,
    },
  ];
  // snackbar
  const [subscribedEmail, setsubscribedEmail] = useState("");
  console.log(subscribedEmail);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  // snackbar
  const handleSubmitSubscribtion = async () => {
    try {
      if (done) {
        setDone(false);
      } else {
        await axios.post("http://localhost:4000/subscribtion", {
          email: subscribedEmail,
        });
        setOpen(true);
        setDone(true);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-5 about-section-main">
      {/* quote */}
      <div className="quooote">
        <blockquote>
          Books are the plane, and the train, and the road. They are the
          destination, and the journey. They are home.
        </blockquote>
        <cite>Anna Quindlen</cite>
      </div>
      {/* quote */}
      <h2 className="mx-3 mt-3 mb-5">Who We Are</h2>

      <motion.div
        className="about mx-auto"
        style={{ width: "100%", height: "70vh", position: "relative" }}
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            opacity: 1,
            y: 0,
            transition: { delay: 1, duration: 1, ease: "easeInOut" },
          },
          hidden: {
            opacity: 0,
            y: 50,
            transition: { delay: 1, duration: 1, ease: "easeInOut" },
          },
        }}
      >
        <div className="about-item" style={{ position: "relative" }}>
          <div
            className="animation-text"
            style={{
              color: "white",
              fontWeight: "bold",
              fontStyle: "italic",
              textAlign: "left",
              padding: "0 20px",
              paddingRight: "600px",
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <p>
                "Our bookstore application is a comprehensive platform designed
                to cater to all book lovers' needs. With an extensive collection
                of books spanning various genres and topics, our app offers
                users an immersive browsing experience. Whether you're searching
                for the latest bestsellers, timeless classics, or niche
                subjects, our curated selection ensures that you'll find exactly
                what you're looking for. Additionally, our user-friendly
                interface and intuitive features make it easy to discover new
                titles, create personalized reading lists, and engage with
                fellow book enthusiasts. Whether you're an avid reader, a casual
                bookworm, or a curious learner, our bookstore application is
                your go-to destination for all things literary."
              </p>
            </motion.div>
          </div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "83%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <img
              src={img7}
              alt="Background"
              className="background-image"
              style={{ width: "450px", height: "420px", objectFit: "cover" }}
            />{" "}
            {/* Adjust width and height as needed */}
          </div>
        </div>
      </motion.div>

      <h2 className="mx-3 mt-5 mb-5">Our Team</h2>
      <div
        className="about mx-auto team-container"
        style={{
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            className="flip-card"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            style={{
              marginBottom: "20px",
              boxShadow: "black",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                />
              </div>
              <div
                className="flip-card-back"
                style={{
                  backgroundColor: "#fff",
                  padding: "20px",
                  borderRadius: "50px",
                }}
              >
                <h4 style={{ color: "#333", marginBottom: "10px" }}>
                  {member.name}
                </h4>
                <p style={{ color: "#666", marginBottom: "9px" }}>
                  {member.position}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* subscribe to our email section */}
      <div className="main-subscribe-container p-5 mb-5 ">
        <div className="info mb-4">
          <h5 style={{ color: "#E9897E" }}>Subscribe for latest news</h5>
        </div>
        <div className="container-subscribe">
          <div className="content">
            {done ? (
              <form className="subscription done">
                <input
                  className="add-email"
                  type="email"
                  placeholder="subscribe@me.now"
                />
                <button
                  className="submit-email"
                  type="button"
                  onClick={handleSubmitSubscribtion}
                >
                  <span className="before-submit">Subscribe</span>
                  <span className="after-submit">
                    Thank you for subscribing!
                  </span>
                </button>
              </form>
            ) : (
              <form className="subscription">
                <input
                  className="add-email"
                  type="email"
                  name="email"
                  value={subscribedEmail}
                  onChange={(e) => setsubscribedEmail(e.target.value)}
                  placeholder="subscribe@me.now"
                />
                <button
                  className="submit-email"
                  type="button"
                  onClick={handleSubmitSubscribtion}
                >
                  <span className="before-submit">Subscribe</span>
                  <span className="after-submit">
                    Thank you for subscribing!
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      {/* subscribe to our email section */}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ bottom: { xs: 90, sm: 50 } }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Message sent successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AboutUs;
