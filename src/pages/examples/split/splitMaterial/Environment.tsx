export default function Environment() {
  return (
    <mesh scale={100}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial color="#444" side={1} />
    </mesh>
  );
}
