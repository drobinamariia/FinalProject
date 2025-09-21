import { useState } from "react";
import api from "../../api";

export default function GenerateCode() {
  const [ctxId, setCtxId] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("sharecodes/", {
        context_id: Number(ctxId),
      });
      setMsg(JSON.stringify(data, null, 2));
    } catch (err) {
      setMsg(
        (err.response?.status || "net") + " " + (err.response?.data || "")
      );
    }
  }

  return (
    <section>
      <h2>Generate share-code</h2>
      <form onSubmit={submit}>
        <label>
          Context ID{" "}
          <input value={ctxId} onChange={(e) => setCtxId(e.target.value)} />
        </label>
        <button type="submit">Generate</button>
      </form>
      <pre>{msg}</pre>
    </section>
  );
}
