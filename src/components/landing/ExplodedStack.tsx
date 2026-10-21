import StackSettle from "./StackSettle";
import styles from "./ExplodedStack.module.css";

export default function ExplodedStack() {
  return (
    <figure
      className={styles.stackColumn}
      aria-labelledby="product-stack-caption"
      aria-describedby="product-stack-description"
      data-product-stack="true"
    >
      <figcaption id="product-stack-caption" className={styles.srOnly}>
        A product in three layers
      </figcaption>
      <p id="product-stack-description" className={styles.srOnly}>
        A real Velo dispatch screen sits over backend routes, services, and a
        queue. A thin data schema forms the base. Three AI-agent lanes reach
        their review marks before work lands on each layer.
      </p>
      <div className={styles.stackStage} data-stack-stage="true" data-stack-motion="ready">
        <StackSettle />
        <svg
          className={styles.stackDrawing}
          viewBox="0 0 620 500"
          role="img"
          aria-labelledby="stack-drawing-title stack-drawing-description"
          focusable="false"
        >
          <title id="stack-drawing-title">
            Interface over backend services and APIs, above a data schema
          </title>
          <desc id="stack-drawing-description">
            Three separated paper layers show the Velo dispatch interface,
            booking and trip services, API routes, an auth guard, a queue, and a
            small relational schema. Agent lanes meet a review tick on each
            layer.
          </desc>

          <g className={styles.agentLanes} aria-hidden="true">
            <path d="M348 12v76" />
            <path d="M520 12v192" />
            <path d="M260 12v334" />
            <path className={styles.agentLeader} d="M232 25h92v-6h24" />
            <text className={styles.agentLabel} x="54" y="28">
              AI agents, reviewed by me
            </text>
          </g>

          <g className={styles.interfaceLayer} data-stack-layer="interface">
            <polygon
              className={styles.printOffset}
              points="118,128 464,93 568,147 222,182"
              transform="translate(7 8)"
            />
            <polygon
              className={styles.sheetSide}
              points="222,182 568,147 568,157 222,192"
            />
            <polygon
              className={styles.sheetFace}
              points="118,128 464,93 568,147 222,182"
            />
            <svg
              x="199"
              y="107"
              width="310"
              height="47"
              viewBox="0 0 1010 153"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
              focusable="false"
            >
              {/* A 2x crop of the strip this sheet shows, not the full
                  1440 px capture: phones (no stack) and desktops alike fetch a
                  few KB instead of 120 KB. */}
              <image
                href="/projects/velo/velo-dispatch-strip.webp"
                x="0"
                y="0"
                width="1010"
                height="153"
              />
            </svg>
          </g>

          <g className={styles.backendLayer} data-stack-layer="backend">
            <polygon
              className={styles.printOffset}
              points="70,235 478,194 600,260 192,301"
              transform="translate(8 9)"
            />
            <polygon
              className={styles.sheetSide}
              points="192,301 600,260 600,273 192,314"
            />
            <polygon
              className={styles.backendFace}
              points="70,235 478,194 600,260 192,301"
            />
            <path className={styles.backendRule} d="m85 238 386-39 112 61" />
            <text className={styles.backendHeading} x="119" y="247">
              BACKEND
            </text>
            <text className={styles.backendSubtitle} x="190" y="240">
              services and APIs
            </text>
            <rect className={styles.guardBox} x="454" y="221" width="92" height="22" />
            <text className={styles.guardText} x="466" y="236">
              Auth guard
            </text>

            <text className={styles.metaLabel} x="115" y="266">
              ROUTES
            </text>
            <text className={styles.route} x="115" y="282">
              <tspan className={styles.routeVerb}>POST</tspan>
              <tspan dx="5">/bookings</tspan>
            </text>
            <text className={styles.route} x="115" y="296">
              <tspan className={styles.routeVerb}>GET</tspan>
              <tspan dx="9">/trips/:id</tspan>
            </text>

            <rect className={styles.serviceBox} x="250" y="250" width="92" height="36" />
            <text className={styles.metaLabel} x="258" y="264">
              SERVICE
            </text>
            <text className={styles.serviceName} x="258" y="278">
              Booking
            </text>
            <rect className={styles.serviceBox} x="350" y="243" width="94" height="37" />
            <text className={styles.metaLabel} x="358" y="257">
              SERVICE
            </text>
            <text className={styles.serviceName} x="358" y="271">
              Trip
            </text>
            <path className={styles.flowLine} d="M207 275h35m103 0h4m95-7h17" />
            <circle className={styles.flowNode} cx="243" cy="275" r="3" />
            <rect className={styles.queueBox} x="462" y="247" width="74" height="33" />
            <text className={styles.metaLabel} x="470" y="261">
              QUEUE
            </text>
            <text className={styles.serviceName} x="470" y="274">
              Dispatch
            </text>
          </g>

          <g className={styles.dataLayer} data-stack-layer="data">
            <polygon
              className={styles.printOffset}
              points="128,369 420,337 535,397 243,429"
              transform="translate(7 8)"
            />
            <polygon
              className={styles.sheetSide}
              points="243,429 535,397 535,407 243,439"
            />
            <polygon
              className={styles.dataFace}
              points="128,369 420,337 535,397 243,429"
            />
            <text className={styles.dataHeading} x="258" y="369">
              DATA
            </text>
            <text className={styles.metaLabel} x="302" y="357">
              RELATIONAL SCHEMA
            </text>
            <path className={styles.schemaRule} d="M292 365h122m-122 16h122m-122 16h122" />
            <path className={styles.schemaColumn} d="M332 365v32m41-32v32" />
            <text className={styles.schemaText} x="300" y="377">
              id
            </text>
            <text className={styles.schemaText} x="340" y="377">
              trip
            </text>
            <text className={styles.schemaText} x="379" y="377">
              status
            </text>
            <text className={styles.schemaType} x="300" y="392">
              uuid
            </text>
            <text className={styles.schemaType} x="340" y="392">
              ref
            </text>
            <text className={styles.schemaType} x="379" y="392">
              enum
            </text>
          </g>

          <g className={styles.reviewMarks} aria-hidden="true">
            <path d="m342 88 6 6 12-13" />
            <path d="m514 204 6 6 12-13" />
            <path d="m254 346 6 6 12-13" />
          </g>
          <g className={styles.agentDots} aria-hidden="true">
            <circle className={styles.interfaceDot} cx="348" cy="88" r="4" />
            <circle className={styles.backendDot} cx="520" cy="204" r="4" />
            <circle className={styles.dataDot} cx="260" cy="346" r="4" />
          </g>

          <g className={styles.annotations} aria-hidden="true">
            <path d="M520 137h84" />
            <circle cx="520" cy="137" r="3" />
            <text data-stack-annotation="interface" x="574" y="127">Interface</text>

            <path d="M536 244h70" />
            <circle cx="536" cy="244" r="3" />
            <text data-stack-annotation="backend" x="572" y="234">Backend</text>

            <path d="m243 403-139 43" />
            <circle cx="243" cy="403" r="3" />
            <text data-stack-annotation="data" x="84" y="464">Data</text>
          </g>
        </svg>
      </div>
    </figure>
  );
}
