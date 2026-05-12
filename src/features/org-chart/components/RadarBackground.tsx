/**
 * Fondo decorativo tipo radar para el canvas del organigrama.
 * Es una capa visual, por eso usa pointer-events-none desde el contenedor padre.
 */
export function RadarBackground() {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <svg
          viewBox="0 0 900 900"
          className="h-[120vw] w-[120vw] min-h-[1500px] min-w-[1500px] max-w-none opacity-70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Halo suave central */}
          <circle cx="450" cy="450" r="95" fill="rgba(34, 211, 238, 0.035)" />
          <circle cx="450" cy="450" r="230" fill="rgba(34, 211, 238, 0.018)" />
  
          {/* Círculos principales del radar */}
          <circle cx="450" cy="450" r="120" stroke="rgba(34, 211, 238, 0.28)" strokeWidth="1.4" />
          <circle cx="450" cy="450" r="220" stroke="rgba(34, 211, 238, 0.22)" strokeWidth="1.2" />
          <circle cx="450" cy="450" r="330" stroke="rgba(34, 211, 238, 0.16)" strokeWidth="1" />
          <circle cx="450" cy="450" r="420" stroke="rgba(34, 211, 238, 0.12)" strokeWidth="1" />
  
          {/* Círculos segmentados para dar estética técnica */}
          <circle
            cx="450"
            cy="450"
            r="155"
            stroke="rgba(125, 249, 255, 0.28)"
            strokeWidth="3"
            strokeDasharray="10 14"
          />
          <circle
            cx="450"
            cy="450"
            r="275"
            stroke="rgba(125, 249, 255, 0.18)"
            strokeWidth="2"
            strokeDasharray="4 18"
          />
  
          {/* Líneas guía del radar */}
          <path d="M450 30V870" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" />
          <path d="M30 450H870" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" />
          <path d="M153 153L747 747" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" />
          <path d="M747 153L153 747" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" />

  
            {/* Línea de escaneo animada */}
            <g className="radar-sweep">
              <path
                d="M450 450 L450 35"
                stroke="rgba(125, 249, 255, 0.55)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Estela suave de la línea */}
              <path
                d="M450 450 L450 35"
                stroke="rgba(125, 249, 255, 0.18)"
                strokeWidth="15"
                strokeLinecap="round"
              />
            </g>
          {/* Punto central */}
          <circle cx="450" cy="450" r="5" fill="rgba(125, 249, 255, 0.7)" />
  
          {/* Pequeños puntos técnicos */}
          <circle cx="450" cy="230" r="4" fill="rgba(125, 249, 255, 0.8)" />
          <circle cx="670" cy="450" r="3" fill="rgba(125, 249, 255, 0.8)" />
          <circle cx="292" cy="608" r="3" fill="rgba(125, 249, 255, 0.8)" />
        </svg>
      </div>
    );
  }