import React, { useEffect, useRef, useState } from "react";
import "./booksview.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import axios from "axios";

const BooksView = () => {
  const [newBooks, setNewBooks] = useState(null);
  useEffect(() => {
    const getRecentBooks = async () => {
      try {
        const req = await axios.get("http://localhost:4000/book/recent");
        const data = req.data.data.recentBooks;
        setNewBooks(data);
      } catch (error) {
        console.error("Error fetching book details:", error);
      }
    };
    getRecentBooks();
  });

  const containerRef = useRef(null);

  const handleScrollLeft = () => {
    console.log("left");
    containerRef.current.scrollLeft -= 200;
  };

  // Function to scroll right
  const handleScrollRight = () => {
    console.log("right");
    containerRef.current.scrollLeft += 200;
  };

  return (
    <section className="most-books mt-0">
      <div className="container" id="Scicence">
        <div className="row-reverse">
          <div className="col-md-12">
            <h2
              className="text-center mt-5 p-5 mb-5"
              style={{ color: "#DD4124", fontSize: "2.5rem" }}
            >
              <b>Recently Added</b>
            </h2>
          </div>
          <div className="books-container">
            {/* Conditional rendering of scroll buttons */}
            <button className="scroll-button left" onClick={handleScrollLeft}>
              <i class="fa-solid fa-arrow-left"></i>{" "}
            </button>
            <button className="scroll-button right" onClick={handleScrollRight}>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
            {/* Conditional rendering of scroll buttons */}
            <div className="books" ref={containerRef}>
              {/* Render book items */}
              {newBooks
                ? newBooks.map((book, index) => (
                    <BookItem
                      key={index}
                      index={book.id}
                      image={book.bookImage.url}
                    />
                  ))
                : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BookItem = ({ index, image }) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      className="book"
      initial={{ opacity: 0, scale: 0 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
      transition={{ delay: index * 0.2, duration: 0.9 }}
      whileHover={{ scale: 1.1, zIndex: 1 }}
    >
      <Link to={`/bookdetails/${index}`}>
        <img src={image} alt={`book-${index}`} loading="lazy" />
      </Link>
    </motion.div>
  );
};

export default BooksView;
