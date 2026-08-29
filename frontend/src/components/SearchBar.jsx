function SearchBar({ value, onChange }) {
  return (
  <input
    type="text"
    placeholder="Search projects..."
    value={value}
    onChange={onChange}
  />
  )
}

export default SearchBar