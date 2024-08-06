import { Style, css } from "hono/css";
import type { FC } from "hono/jsx";

const Layout: FC = (props) => {
  return (
    <html lang="en">
      <head>
        <title>{props.title}</title>
        <Style>
          {css`
            .green.darken-3 {
                background-color: #4D4D33 !important;
            }

            /* label focus color */
            .input-field input[type=text]:focus + label, .materialize-textarea:focus:not([readonly]) + label {
                color: #4e342e !important;
            }

            /* label underline focus color */
            .input-field input[type=text]:focus, .materialize-textarea:focus:not([readonly]) {
                border-bottom: 1px solid #4e342e !important;
                box-shadow: 0 1px 0 0 #4e342e !important;
            }
            `}
        </Style>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js" />
      </head>
      <body class="black">{props.children}</body>
    </html>
  );
};

export default Layout;
