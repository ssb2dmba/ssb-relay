import type { FC } from "hono/jsx";
import Layout from "./Layout";

const InviteCaptchaRequest: FC = () => {
  return (
    <Layout title="Secure Scuttlebut request invite">
      <div class="row p4" style="margin-top:48px;">
        <div class="col s12">
          <div class="card green darken-3">
            <div class="card-image">
              <img src="captcha.svg" alt="captcha" />
            </div>
            <div class="card-content white-text">
              <form
                class="container"
                method="post"
                action="invite-captcha-reponse"
              >
                <div class="row">
                  <span class="card-title">Are you a robot ?</span>
                  <div class="input-field col m6">
                    <p>&nbsp;</p>
                    <input
                      autofocus
                      name="captcha"
                      id="captcha"
                      type="text"
                      class="validate"
                    />
                    <label for="captcha">please fill text with image</label>
                  </div>
                  <div class="input-field col m6 right-align">
                    <button
                      class="btn waves-effect waves-light brown darken-3"
                      type="submit"
                      name="action"
                    >
                      Submit <i class="material-icons right">lock_open</i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default InviteCaptchaRequest;
