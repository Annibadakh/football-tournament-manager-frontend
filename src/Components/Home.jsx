
import poster from "./poster.png";
import poster2 from "./poster2.jpg";

const Home = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl text-center w-full h-auto font-bold mb-4">Recent Tournament</h1>
      <div>
      <img className="mb-10" src={poster}></img>
      <img src={poster2}></img>
      </div>
    </div>
  );
};

export default Home;
