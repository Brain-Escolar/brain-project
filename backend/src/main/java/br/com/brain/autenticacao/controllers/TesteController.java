package br.com.brain.autenticacao.controllers;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.brain.shared.infra.s3.S3Service;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("teste")
@RequiredArgsConstructor
public class TesteController {

    private final S3Service s3Service;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> upload(
            @RequestPart("file") MultipartFile file) throws IOException {

        s3Service.upload("uploads/" + file.getOriginalFilename(), file);

        return ResponseEntity.ok().build();
    }

}
