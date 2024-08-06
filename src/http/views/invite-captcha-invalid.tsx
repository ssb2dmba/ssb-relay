import type { FC } from "hono/jsx";
import Layout from "./Layout";

const InviteCaptchaInvalid: FC<{ error: string }> = (props: {
  error: string;
}) => {
  return (
    <Layout title="Captcha or Request/Response invalid">
      <p>Error</p>
      <p>{props.error}</p>
    </Layout>
  );
};
export default InviteCaptchaInvalid;
