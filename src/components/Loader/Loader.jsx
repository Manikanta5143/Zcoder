import styles from "./Loader.module.css";

const Loader = ({ title = "Loading...", subtitle = "Please wait while we load..." }) => {
  return (
    <div className={styles.loaderContainer}>

      <div className={styles.logoWrapper}>
        <div className={styles.ring}></div>

        <img
          src="/letter-z.svg"
          alt="ZCoder"
          className={styles.logo}
        />
      </div>

      <div className={styles.dots}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <h2>{title}</h2>

      <p>{subtitle}</p>

    </div>
  );
};

export default Loader;