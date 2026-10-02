package br.com.brain.crm;

import br.com.brain.crm.dto.CargaEquipeDto;
import br.com.brain.crm.dto.OrigemLeadDto;
import br.com.brain.crm.dto.RelatorioCrmDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("crm")
public class CrmController {

    private final OrigemLeadRepository origemLeadRepository;
    private final ProcessoMatriculaService processoMatriculaService;

    @GetMapping("/origens")
    public ResponseEntity<List<OrigemLeadDto>> origens() {
        return ResponseEntity.ok(origemLeadRepository.findAllByOrderByNomeAsc().stream()
                .map(OrigemLeadDto::new)
                .toList());
    }

    @GetMapping("/equipe")
    public ResponseEntity<List<CargaEquipeDto>> equipe() {
        return ResponseEntity.ok(processoMatriculaService.equipe());
    }

    @GetMapping("/relatorios")
    public ResponseEntity<RelatorioCrmDto> relatorios(@RequestParam(required = false) Integer anoLetivo) {
        return ResponseEntity.ok(processoMatriculaService.relatorios(anoLetivo));
    }
}
