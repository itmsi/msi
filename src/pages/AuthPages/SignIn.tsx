import PageMeta from "../../components/common/PageMeta";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Motor Sights International - Sign In"
        description="Motor Sights International - Sign In Page"
        image="/motor-sights-international.png"
      />
        <SignInForm />
    </>
  );
}
