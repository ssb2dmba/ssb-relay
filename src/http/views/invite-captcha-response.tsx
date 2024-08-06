import type { FC } from "hono/jsx";
import Layout from "./Layout";

const InviteCaptchaResponse: FC<{ invite: string }> = (props: {
  invite: string;
}) => {
  return (
    <Layout title={props.invite}>
      <div class="row" style="margin-top:48px;">
        <div class="col s12 m10 offset-m1">
          <div class="card green darken-3">
            <div class="card-content white-text">
              <span class="card-title">your invite code :</span>
              <p style="word-wrap: break-word;">{props.invite}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default InviteCaptchaResponse;
