import next from "eslint-config-next";

const config = [...next, { ignores: [".next/**", ".data/**", "next-env.d.ts"] }];

export default config;
