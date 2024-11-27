import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";


function App({ text, setText, count, setCount, categories, speak, setSpeak }) {
  return (
    <>
      <Loader />
      <Leva hidden />
      <UI text={text} setText={setText} count={count} setCount={setCount} categories={categories} speak={speak} setSpeak={setSpeak} />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience text={text} setText={setText} count={count} setCount={setCount} categories={categories} speak={speak} setSpeak={setSpeak} />
      </Canvas>
    </>
  );
}

export default App;
