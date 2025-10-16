export default function ErrorButton() {
  return (
    <button
      type="button"
      onClick={() => {
        throw new Error('Sentry test error from ErrorButton');
      }}
    >
      Break the world
    </button>
  );
}
