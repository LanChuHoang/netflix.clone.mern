import "./listItem.scss";
import {
  PlayArrow,
  Add,
  ThumbUpAltOutlined,
  ThumbDownOutlined,
} from "@material-ui/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ListItem({ index, item }) {
  const [isHovered, setIsHovered] = useState(false);
  const [movie, setMovie] = useState({});

  useEffect(() => {
    // const getMovie = () => {
    //   // try {
    //   //   const res = await axios.get(
    //   //     "http://locahost:8000/api/movie/find/" + item,
    //   //     {
    //   //       headers: {
    //   //         Authorization:
    //   //           "Bearer " +
    //   //           JSON.parse(localStorage.getItem("user")).accessToken,
    //   //       },
    //   //     }
    //   //   );
    //   //   setMovie(res.data);
    //   // } catch (err) {
    //   //   console.log(err);
    //   // }
    //   setMovie(item);
    // };
    // getMovie();
    setMovie(item);
  }, [item]);
  // console.log(movie);

  const timeFormatter = (minutes) => {
    if (minutes < 60) return `${minutes} mins`;
    const numHours = Math.floor(minutes / 60);
    const numMins = minutes % 60;
    return `${numHours}h ${numMins ? `${numMins} mins` : ""}`;
  };

  return (
    <Link to={{ pathname: "/watch", movie: movie }}>
      <div
        className="listItem"
        style={{ left: isHovered && index * 225 - 50 + index * 2.5 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img src={movie.imageThumbnail} alt="" />
        {isHovered && (
          <>
            {/* <video
              src={"https://www.youtube.com/watch?v=O8QYGOqekVI"}
              autoPlay={true}
              loop
            /> */}
            <iframe
              width="400"
              height="200"
              src="https://www.youtube.com/embed/dYYQx4c4w1A"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
            <div className="itemInfo">
              <div className="icons">
                <PlayArrow className="icon" />
                <Add className="icon" />
                <ThumbUpAltOutlined className="icon" />
                <ThumbDownOutlined className="icon" />
              </div>

              <div className="itemInfoTop">
                <span className="miniTitle">{movie.title}</span>
                <span className="runtime">
                  {movie.isSeries
                    ? `${movie.numSeasons} season${
                        movie.numSeasons > 1 ? "s" : ""
                      }`
                    : timeFormatter(movie.runtime)}
                </span>
                <span className={movie.adult ? "limit" : ""}>
                  {movie.adult ? "+18" : ""}
                </span>
                <span className="miniYear">
                  {new Date(movie.releaseDate).getFullYear()}
                </span>
              </div>
              <div className="desc">{movie.description}</div>
              <div className="genre">{movie.genres.join(", ")}</div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
