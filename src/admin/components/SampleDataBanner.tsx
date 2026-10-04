export function SampleDataBanner() {
  return (
    <div className="sn-an__banner" role="note">
      <strong>Sample data.</strong> These panels show synthetic numbers generated for layout and
      testing. Nothing here describes real usage, spend or people. Live data is switched on with{' '}
      <code>ANALYTICS_MODE=live</code> once the data source is connected.
    </div>
  )
}

export function EmptyState({
  title,
  missing,
  message,
}: {
  title: string
  missing?: string[]
  message?: string
}) {
  return (
    <div className="sn-an__empty" role="status">
      <h2>{title}</h2>
      {message ? <p>{message}</p> : null}
      {missing?.length ? (
        <>
          <p>Not connected yet. Set these in the Vercel Production environment, then redeploy:</p>
          <ul>
            {missing.map((m) => (
              <li key={m}>
                <code>{m}</code>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
