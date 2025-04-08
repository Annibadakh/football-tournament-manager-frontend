
import poster from "./poster.png";

const Home = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl text-center w-full h-auto font-bold mb-4">Recent Tournament</h1>
      <div>
        <img src={poster}></img>
        
      </div>
    </div>
  );
};

export default Home;
