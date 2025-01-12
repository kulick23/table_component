import React, { useEffect, useState } from "react";
import './App.css'; 

function App() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(() => {
    const savedPage = localStorage.getItem("page");
    return savedPage ? Number(savedPage) : 1;
  });
  const [searchText, setSearchText] = useState(() => localStorage.getItem("searchText") || "");
  const [minScore, setMinScore] = useState(() => localStorage.getItem("minScore") || "");
  const [maxScore, setMaxScore] = useState(() => localStorage.getItem("maxScore") || "");
  const [sortField, setSortField] = useState<string>(() => localStorage.getItem("sortField") || "title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(() => (localStorage.getItem("sortOrder") as "asc" | "desc") || "asc");
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<string>(() => localStorage.getItem("selectedType") || "");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.jikan.moe/v4/anime?page=${page}&limit=10`
        );
        const json = await response.json();
        if (json.data) {
          console.log("Data fetched for page", page, json.data);
          setData(json.data);
          setTotalPages(json.pagination.last_visible_page);
        } else {
          console.error("No data found in response", json);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [page]);

  useEffect(() => {
    localStorage.setItem("page", page.toString());
    localStorage.setItem("searchText", searchText);
    localStorage.setItem("minScore", minScore);
    localStorage.setItem("maxScore", maxScore);
    localStorage.setItem("sortField", sortField);
    localStorage.setItem("sortOrder", sortOrder);
    localStorage.setItem("selectedType", selectedType);

    const queryParams = new URLSearchParams({
      page: page.toString(),
      searchText,
      minScore,
      maxScore,
      sortField,
      sortOrder,
      selectedType,
    });
    window.history.replaceState(null, "", `?${queryParams.toString()}`);
  }, [page, searchText, minScore, maxScore, sortField, sortOrder, selectedType]);

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
    const matchType = selectedType ? item.type === selectedType : true;
    return matchTitle && inMinRange && inMaxRange && matchType;
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
        <select
          className="border p-1"
          value={sortField}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="title">Название</option>
          <option value="score">Рейтинг</option>
          <option value="aired">Дата выхода</option>
          <option value="type">Тип</option>
        </select>
        <select
          className="border p-1"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">Все типы</option>
          <option value="TV">TV</option>
          <option value="Movie">Movie</option>
          <option value="OVA">OVA</option>
          <option value="Special">Special</option>
          <option value="ONA">ONA</option>
          <option value="Music">Music</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center">Загрузка...</div>
      ) : (
        <div className="overflow-x-auto">
          {data.length > 0 ? (
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
                    <td className="border px-4 py-2">{item.title || "данные отсутствуют"}</td>
                    <td className="border px-4 py-2">{item.score !== undefined ? item.score : "данные отсутствуют"}</td>
                    <td className="border px-4 py-2">{item.aired?.string || "данные отсутствуют"}</td>
                    <td className="border px-4 py-2">{item.type || "данные отсутствуют"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center">Нет данных для отображения</div>
          )}
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
        <span>Страница: {page} из {totalPages}</span>
        <button
          disabled={page >= totalPages}
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