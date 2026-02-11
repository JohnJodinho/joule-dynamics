import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Demos } from "@/components/sections/Demos";

function App() {
  return (
    <Layout>
      <Hero />
      <Services />
      <Demos />
    </Layout>
  );
}

export default App;
