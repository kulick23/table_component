import React, { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [sortField, setSortField] = useState<string>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isRestored, setIsRestored] = useState(false);

  // Восстанавливаем состояние из localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("tableComponentState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setSearchText(parsed.searchText ?? "");
        setMinScore(parsed.minScore ?? "");
        setMaxScore(parsed.maxScore ?? "");
        setSortField(parsed.sortField ?? "title");
        setSortOrder(parsed.sortOrder ?? "asc");
        setPage(parsed.page ?? 1);
        console.log("State restored from localStorage:", parsed);
      } catch (error) {
        console.error("Error parsing saved state:", error);
      }
    }
    setIsRestored(true);
  }, []);

  // Сохраняем состояние в localStorage
  useEffect(() => {
    if (isRestored) {
      const state = {
        searchText,
        minScore,
        maxScore,
        sortField,
        sortOrder,
        page,
      };
      localStorage.setItem("tableComponentState", JSON.stringify(state));
      console.log("State saved to localStorage:", state);
    }
  }, [searchText, minScore, maxScore, sortField, sortOrder, page, isRestored]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?page=${page}&limit=10`
      );
      const json = await response.json();
      setData(json.data || []);
    };
    fetchData();
  }, [page]);

  // Фильтрация данных
  const filteredData = data.filter((item) => {
    const matchTitle = item.title.toLowerCase().includes(searchText.toLowerCase());
    const score = item.score || 0;
    const inMinRange = minScore ? score >= Number(minScore) : true;
    const inMaxRange = maxScore ? score <= Number(maxScore) : true;
    return matchTitle && inMinRange && inMaxRange;
  });

  // Сортировка данных
  filteredData.sort((a, b) => {
    const valA = a[sortField] || 0;
    const valB = b[sortField] || 0;
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Получаем ключи для заголовков таблицы, исключая ненужные колонки
  const tableHeaders = data.length > 0 ? Object.keys(data[0]).filter(header => !['titles', 'title_english', 'title_japanese', 'title_synonyms'].includes(header)) : [];

  const renderCellContent = (content: any, header: string, item: any) => {
    if (header === 'title') {
      return (
        <>
          <div>English title: {item.title_english || 'N/A'}</div>
          <div>Original title: {item.title_japanese || 'N/A'}</div>
        </>
      );
    }
    if (header === 'approved') {
      return content ? "Yes" : "No";
    }
    if (header === 'aired' && content && content.string) {
      return content.string;
    }
    if (header === 'broadcast' && content && content.string) {
      return content.string;
    }
    if (header === 'producers' && Array.isArray(content)) {
      return content.map((producer: any) => producer.name).join(", ");
    }
    if (header === 'licensors' && Array.isArray(content)) {
      return content.map((licensor: any) => licensor.name).join(", ");
    }
    if (header === 'studios' && Array.isArray(content)) {
      return content.map((studio: any) => studio.name).join(", ");
    }
    if (header === 'genres' && Array.isArray(content)) {
      return content.map((genre: any) => genre.name).join(", ");
    }
    if (header === 'explicit_genres' && Array.isArray(content)) {
      return content.map((genre: any) => genre.name).join(", ");
    }
    if (header === 'themes' && Array.isArray(content)) {
      return content.map((theme: any) => theme.name).join(", ");
    }
    if (header === 'demographics' && Array.isArray(content)) {
      return content.map((demographic: any) => demographic.name).join(", ");
    }
    if (header === 'url' && typeof content === 'string') {
      return (
        <a href={content} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }
    if (typeof content === "object" && content !== null) {
      if (content.jpg && content.jpg.image_url) {
        return <img src={content.jpg.image_url} alt="Anime" className="w-16 h-16" />;
      }
      if (content.youtube_id) {
        return (
          <a href={`https://www.youtube.com/watch?v=${content.youtube_id}`} target="_blank" rel="noopener noreferrer">
            Watch Trailer
          </a>
        );
      }
      if (content.youtube_id === null) {
        return "Трейлер отсутствует";
      }
      return JSON.stringify(content);
    }
    return content;
  };

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
          onChange={(e) => setMinScore(e.target.value)}
        />
        <input
          className="border p-1"
          type="number"
          placeholder="Макс. оценка"
          value={maxScore}
          onChange={(e) => setMaxScore(e.target.value)}
        />
      </div>

      <table className="table-auto w-full border-collapse border">
        <thead>
          <tr>
            {tableHeaders.map((header) => (
              <th
                key={header}
                className="border px-4 py-2 cursor-pointer"
                onClick={() => handleSort(header)}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.mal_id}>
              {tableHeaders.map((header) => (
                <td key={header} className="border px-4 py-2">
                  {renderCellContent(item[header], header, item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex gap-2">
        <button
          disabled={page <= 1}
          className="border px-2 py-1"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Назад
        </button>
        <span>Страница: {page}</span>
        <button
          className="border px-2 py-1"
          onClick={() => setPage((prev) => prev + 1)}
        >
          Вперёд
        </button>
      </div>
    </div>
  );
}

export default App;