import React, { CSSProperties, useState, PropsWithChildren } from "react";

const styles: Record<string, CSSProperties> = {
	container: {
		display: "flex",
		flexDirection: "column",
		maxWidth: "200px"
	},
	menu: {
		border: "1px solid darkgray",
		marginTop: "5px",
		borderRadius: "5px"
	},
	button: {
		cursor: "pointer"
	},
	menuitem: {
		padding: "8px 10px",
		cursor: "pointer"
	}
};

type SelectProps = {
	items: {
		label: string;
		value: string;
	}[];
	initialOpen?: boolean;
	defaultSelected?: string;
	onSelect?: (nextState: { label: string; value: string }) => void;
};

export function Select({
	items = [],
	initialOpen = false,
	defaultSelected = "",
	onSelect = () => null
}: SelectProps) {
	const [selected, setSelected] = useState(
		items.find((option) => option.value === defaultSelected)
	);
	const [isOpen, setOpen] = useState(initialOpen);

  const selectedDisplayValue = selected?.label || "Pick an option";
  
	return (
		<div style={styles.container}>
			<button
				style={styles.button}
				onClick={() => setOpen((prevState) => !prevState)}
      >
				{selectedDisplayValue}
			</button>

			{isOpen && (
				<div style={styles.menu}>
					{items.map((option) => {
            function onOptionSelect(){
              onSelect(option);
              setSelected(option);
              setOpen(false);
            }
						return (
							<Option
								key={option.value}
								onClick={onOptionSelect}
              >
								{option.label}
							</Option>
						);
					})}
				</div>
			)}
		</div>
	);
}

function Option({
	onClick,
	children
}: PropsWithChildren<{
	onClick: () => void;
}>) {
	const [isHovering, setHovering] = useState(false);
	return (
		<div
			style={{
        ...styles.menuitem,
        ...(isHovering ? { background: "lightblue" } : {})
      }}
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
			onClick={onClick}
    >
			{children}
		</div>
	);
}
