import React, { useEffect, useState } from "react";
import './App.css'; 

function App() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [sortField, setSortField] = useState<string>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?page=${page}&limit=10`
      );
      const json = await response.json();
      setData(json.data || []);
      setLoading(false);
    };
    fetchData();
  }, [page]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleMinScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(10, Number(e.target.value)));
    setMinScore(value.toString());
    if (maxScore && value > Number(maxScore)) {
      setMaxScore(value.toString());
    }
  };

  const handleMaxScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(10, Number(e.target.value)));
    setMaxScore(value.toString());
    if (minScore && value < Number(minScore)) {
      setMinScore(value.toString());
    }
  };

  const filteredData = data.filter((item) => {
    const matchTitle = item.title.toLowerCase().includes(searchText.toLowerCase());
    const score = item.score || 0;
    const inMinRange = minScore ? score >= Number(minScore) : true;
    const inMaxRange = maxScore ? score <= Number(maxScore) : true;
    return matchTitle && inMinRange && inMaxRange;
  });

  filteredData.sort((a, b) => {
    let valA, valB;
    if (sortField === 'aired') {
      valA = new Date(a[sortField]?.from).getTime() || 0;
      valB = new Date(b[sortField]?.from).getTime() || 0;
    } else {
      valA = a[sortField] || 0;
      valB = b[sortField] || 0;
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4">
        <input
          className="border p-1"
          type="text"
          placeholder="Поиск по названию"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <input
          className="border p-1"
          type="number"
          placeholder="Мин. оценка"
          value={minScore}
          onChange={handleMinScoreChange}
        />
        <input
          className="border p-1"
          type="number"
          placeholder="Макс. оценка"
          value={maxScore}
          onChange={handleMaxScoreChange}
        />
      </div>

      {loading ? (
        <div className="text-center">Загрузка...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border">
            <thead>
              <tr>
                <th className="border px-4 py-2 cursor-pointer bg-gray-200" onClick={() => handleSort('title')}>Название</th>
                <th className="border px-4 py-2 cursor-pointer bg-gray-200" onClick={() => handleSort('score')}>Рейтинг</th>
                <th className="border px-4 py-2 cursor-pointer bg-gray-200" onClick={() => handleSort('aired')}>Дата выхода</th>
                <th className="border px-4 py-2 cursor-pointer bg-gray-200" onClick={() => handleSort('type')}>Тип</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.mal_id}>
                  <td className="border px-4 py-2">{item.title}</td>
                  <td className="border px-4 py-2">{item.score}</td>
                  <td className="border px-4 py-2">{item.aired?.string}</td>
                  <td className="border px-4 py-2">{item.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          disabled={page <= 1}
          className="border px-2 py-1 bg-blue-500 text-white disabled:bg-gray-300"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Назад
        </button>
        <span>Страница: {page}</span>
        <button
          className="border px-2 py-1 bg-blue-500 text-white"
          onClick={() => setPage((prev) => prev + 1)}
        >
          Вперёд
        </button>
      </div>
    </div>
  );
}

export default App;