// app/components/Posts.tsx
import React from "react";
import * as S from "./styles";
import Link from "next/link";
import { Button } from "@mui/material";
import SwitchTheme from "@/components/switchTheme/switchTheme";

// Definindo o tipo para os dados
type Post = {
  id: number;
  title: string;
  body: string;
};

const Posts = async () => {
  // Fazendo a requisição para a API JSONPlaceholder
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts: Post[] = await response.json(); // Convertendo a resposta para o formato esperado

  // Retornando a lista de posts
  return (
    <S.Container>
      <SwitchTheme />

      <Link href="/login">
        <Button variant="contained">Teste Login</Button>
      </Link>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </li>
        ))}
      </ul>
    </S.Container>
  );
};

export default Posts;
