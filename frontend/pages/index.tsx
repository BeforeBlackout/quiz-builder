export function getServerSideProps() {
  return {
    redirect: {
      destination: "/quizzes",
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}
