from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.entities import MappingProfile, Template, TemplateField, User

PRESET_EMPLOYEES = {
    "key": "empleados",
    "name": "Empleados",
    "description": "Formato Importación Empleado.xlsx listo para cargar fotos y exportar filas de empleados.",
    "filename": "Formato Importación Empleado.xlsx",
    "sheet_name": "Formato",
    "start_row": 2,
    "fields": [
        ("codigo", "B", "Código"),
        ("nombre", "C", "Nombre"),
        ("segundo_nombre", "D", "Segundo Nombre"),
        ("apellido_paterno", "E", "Apellido Paterno"),
        ("apellido_materno", "F", "Apellido Materno"),
        ("profesion", "G", "Profesión"),
        ("direccion", "H", "Dirección"),
        ("sexo", "I", "Sexo"),
        ("fecha_nacimiento", "J", "Fecha Nacimiento"),
        ("pais", "K", "Pais"),
        ("departamento", "L", "Departamento"),
        ("ciudad", "M", "Ciudad"),
        ("procedencia", "N", "Procedencia"),
        ("estado_civil", "O", "Estado Civil"),
        ("tipo_documento", "P", "Tipo Documento"),
        ("ci", "Q", "C.I."),
        ("tipo_planilla", "R", "Tipo Planilla"),
        ("sucursal", "S", "Sucursal"),
        ("moneda", "T", "Moneda"),
        ("tipo_pago", "U", "Tipo Pago"),
        ("expedido", "V", "Expedido"),
        ("telefono_1", "W", "Telefono 1"),
        ("telefono_2", "X", "Telefono 2"),
        ("movil", "Y", "Móvil"),
        ("email", "Z", "E_mail"),
        ("pais_destino", "AA", "Pais Destino"),
        ("departamento_destino", "AB", "Departamento Destino"),
        ("ciudad_destino", "AC", "Ciudad Destino"),
        ("fecha_contrato", "AD", "Fecha Contrato"),
        ("fecha_ingreso", "AE", "Fecha Ingreso"),
        ("haber_basico", "AF", "Haber Básico"),
        ("hrs_jornada_trabajo", "AG", "Hrs. Jornada Trabajo"),
        ("cargo", "AH", "Cargo"),
        ("tipo_sueldo", "AI", "Tipo Sueldo"),
        ("tipo_contrato", "AJ", "Tipo Contrato"),
        ("afp", "AK", "AFP"),
        ("nua", "AL", "NUA"),
        ("aporte_afp", "AM", "Aporte AFP"),
        ("area", "AN", "Area"),
        ("centro_de_costo", "AO", "Centro de Costo"),
        ("observacion", "AP", "Observación"),
    ],
}


def employee_logical_keys() -> list[str]:
    return [logical_key for logical_key, _, _ in PRESET_EMPLOYEES["fields"]]


def seed_presets(db: Session) -> None:
    existing = db.scalar(select(Template).where(Template.name == PRESET_EMPLOYEES["name"]))
    if existing:
        return

    system_user = db.scalar(select(User).where(User.email == "system@smartform.local"))
    if not system_user:
        system_user = User(
            email="system@smartform.local",
            password_hash=hash_password("smartform-system"),
            is_active=False,
        )
        db.add(system_user)
        db.flush()

    asset_path = Path(__file__).resolve().parents[2] / "assets" / "presets" / "empleados.xlsx"
    workbook_blob = asset_path.read_bytes()

    template = Template(
        owner_id=system_user.id,
        name=PRESET_EMPLOYEES["name"],
        filename=PRESET_EMPLOYEES["filename"],
        workbook_blob=workbook_blob,
    )
    db.add(template)
    db.flush()

    for logical_key, column, label in PRESET_EMPLOYEES["fields"]:
        db.add(
            TemplateField(
                template_id=template.id,
                logical_key=logical_key,
                label=label,
                data_type="string",
                required=False,
            )
        )

    db.add(
        MappingProfile(
            template_id=template.id,
            name="Mapeo Empleados",
            sheet_name=PRESET_EMPLOYEES["sheet_name"],
            start_row=PRESET_EMPLOYEES["start_row"],
            mapping_json={logical_key: column for logical_key, column, _ in PRESET_EMPLOYEES["fields"]},
        )
    )
    db.commit()
